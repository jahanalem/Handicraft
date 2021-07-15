using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Umbraco.Core.Models;
using System.Configuration;
using System.Net.Mail;
using umbraco.cms.businesslogic.web;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using Jahan.Handicraft.Model.UModel.ViewModel;
using Jahan.Infrastructure.Helper;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Core.Logging;
using Jahan.Handicraft.DataAccess.UDAL;
using System.Web.UI.WebControls;
using System.Web;
using umbraco;


namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.App_Plugins.Reply
{
    [PluginController("Reply")]
    [IsBackOffice]
    public class ReplyToIncomingCallController : UmbracoAuthorizedJsonController
    {
        [HttpPost]
        [ChildActionOnly]
        public ActionResult ReplyMessage(SendMailViewModel vm)
        {
            SendMail(vm);
            return null;
        }

        public IEnumerable<MembershipGroups> GetAccessingMembershipRoles(string contentId)
        {
            var list = new List<MembershipGroups>();
            IContent content = Services.ContentService.GetById(int.Parse(contentId));

            if (Access.IsProtected(content.Id, content.Path))
            {
                var accessingMembershipRoles = Access.GetAccessingMembershipRoles(content.Id, content.Path);
                if (accessingMembershipRoles.Length > 0)
                {
                    list.AddRange(accessingMembershipRoles.Select(group => new MembershipGroups { Group = group }));
                }
            }
            return list;
        }

        public IList<PageStatus> GetPagePublishingStatus(string contentId)
        {
            var list = new List<PageStatus>();
            IContent content = Services.ContentService.GetById(int.Parse(contentId));

            list.Add(new PageStatus
            {
                Status = content.Status.ToString(),
                ReleaseDate = content.ReleaseDate.ToString(),
                ExpireDate = content.ExpireDate.ToString()
            });
            return list;
        }

        private void SendMail(SendMailViewModel model)
        {
            using (var client = new SmtpClient())
            {
                string destDir = System.Web.HttpContext.Current.Server.MapPath("~/Template/ReplyContactUs.html");
                string template = CreateTemplateEmail.Instance.GetTemplate(destDir);
                string fullName = model.FullName;
                if (string.IsNullOrEmpty(fullName))
                {
                    fullName = "!";
                }
                string subject = string.Format("{0} Reply to your contact ",
                                           ConfigurationManager.AppSettings["domain"].Replace("http://", ""));
                var t1 = model.ReplyText;
                var t2 = model.ReplyText.ToHtml();
                var t3 = BodyText(model.ReplyText);
                var body = template.Replace("#fullName", fullName)
                    .Replace("#emailUser", model.Email)
                    .Replace("#reply", model.ReplyText)
                    .Replace("#yourMessage", model.TextMessage)
                    .Replace("#respondent", "handicraft");
                using (MailMessage mail = new MailMessage())
                {
                    var domainName = ConfigurationManager.AppSettings["domain"];
                    mail.From = new MailAddress(model.Email, domainName.Replace("http://", ""), System.Text.Encoding.UTF8);
                    mail.To.Add(new MailAddress(model.Email));
                    mail.Subject = subject;
                    mail.Body = body;
                    mail.IsBodyHtml = true;
                    client.Send(mail);
                }
            }
        }
        private String BodyText(string obj)
        {
            return !string.IsNullOrEmpty(obj) ? System.Web.HttpUtility.HtmlEncode(obj.Trim()) : string.Empty;
        }
    }

    public class MembershipGroups
    {
        public string Group { get; set; }
    }

    public class PageStatus
    {
        public string Status { get; set; }
        public string ReleaseDate { get; set; }
        public string ExpireDate { get; set; }
    }
}