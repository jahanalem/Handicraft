using System;
using System.Linq;
using System.Web.Mvc;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Core.Logging;
using Umbraco.Core.Models;
using Jahan.Handicraft.DataAccess.UDAL;
using System.Configuration;
using System.Net.Mail;
using Jahan.Infrastructure.Helper;

using System.Collections.Generic;
using System.Net;
using System.Web;
using System.Web.UI.WebControls;
using Jahan.Handicraft;
using umbraco;
using umbraco.cms.businesslogic.web;
using Umbraco.Core;
using Umbraco.Core.Publishing;
using Umbraco.Core.Services;
using Umbraco.Web;
using Umbraco.Web.Mvc;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class IncomingCallSurfaceController : BaseSurfaceController
    {

        [HttpPost]
        [ChildActionOnly]
        public ActionResult ReplyMessage()
        {
            //TODO: how should be write this method that be proper for getting data from angularjs?
            return null;
        }

        [ChildActionOnly]
        public ActionResult ContactForm()
        {
            var model = new IncomingCall();

            //Initialize model however you want
            model.FullName = "Enter your name";


            //In case you need to access the home node

            return PartialView("_IncomingCall", model);
        }

        [ValidateAntiForgeryToken()]
        [HttpPost]
        public ActionResult ContactForm(IncomingCall model)
        {
            TempData["hasError"] = false;
            if (!ModelState.IsValid)
            {
                TempData["hasError"] = true;
                return CurrentUmbracoPage();
            }
            // TODO: Server validation
            if (ModelState.IsValid)
            {
                LogHelper.Info<ContactUs>(model.Email);
                // TODO: Send mail method
                IPublishedContent incomingCallsNode = CurrentNode.Children.Where(c => c.DocumentTypeAlias.Equals(ContentTypeAlias.IncomingCalls)).FirstOrDefault();
                if (incomingCallsNode != null)
                {
                    IContent call = incomingCallsNode.CreateContentAsChild(DateTime.UtcNow.Ticks.ToString(), ContentTypeAlias.IncomingCall);
                    call.SetValue(model).SaveAndPublishWithStatus();
                    var isActiveForwardMail = ConfigurationManager.AppSettings["IsActiveForwardMail"].ToLower();
                    switch (isActiveForwardMail)
                    {
                        case "true":
                            SendMail(model);
                            break;
                    }
                }
                try
                {
                    //umbraco.library.SendMail(sendEmailsFrom, sendEmailsTo, subject, body, true);
                    TempData["InfoMessage"] = "Your message has been successfully sent and we will be in touch soon...";
                    ModelState.Clear();
                    model.FullName = string.Empty;
                    model.ContactNumber = string.Empty;
                    model.Subject = String.Empty;
                    model.Email = string.Empty;
                    model.TextMessage = string.Empty;
                    return RedirectToCurrentUmbracoPage();
                }
                catch (Exception ex)
                {
                    TempData["ErrorMessage"] = ex.Message + ex.StackTrace;
                }
            }
            else
            {
                TempData["hasError"] = true;
                //return to the current form page with the fields still populated
                return CurrentUmbracoPage();
            }
            TempData["success"] = true;
            return CurrentUmbracoPage();
        }
        private String BodyText(string obj)
        {
            return !string.IsNullOrEmpty(obj) ? System.Web.HttpUtility.HtmlEncode(obj.Trim()) : string.Empty;
        }

        private void SendMail(IncomingCall model)
        {
            using (var client = new SmtpClient())
            {
                string destDir = Server.MapPath("~/Template/GeneralEmailTemplate.html");
                string template = CreateTemplateEmail.Instance.GetTemplate(destDir);
                string body;
                string fullName = model.FullName;
                if (string.IsNullOrEmpty(fullName))
                {
                    fullName = "!";
                }
                string subject = string.Format("{0} ", fullName);
                var textMessage = BodyText(model.TextMessage);
                if (string.IsNullOrEmpty(textMessage))
                {
                    body = "empty body !";
                }
                else
                {
                    body = template.Replace("#fullName", fullName).Replace("#email", model.Email).Replace("#telephone", model.ContactNumber).Replace("#body", textMessage);
                }
                var mailForward = ConfigurationManager.AppSettings["forwardMail"];
                //client.Send(model.Email, mailForward, model.Subject, body);
                using (MailMessage mail = new MailMessage())
                {
                    var domainName = ConfigurationManager.AppSettings["domain"];
                    mail.From = new MailAddress(model.Email, domainName.Replace("http://", ""), System.Text.Encoding.UTF8);
                    mail.To.Add(new MailAddress(mailForward));
                    mail.Subject = model.Subject;
                    mail.Body = body;
                    mail.IsBodyHtml = true;
                    client.Send(mail);
                }
            }
        }
    }
}