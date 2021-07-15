using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Publishing;

namespace Jahan.Handicraft.DataAccess.UDAL
{
    public static class DbHelper
    {
        public static IContent SetValue<TModel>(this IContent content, TModel obj) where TModel : BaseEntity
        {
            var contentName = content.ContentType.Alias;
            var modelName = typeof(TModel).Name;
            if (contentName.Equals(modelName))
            {
                List<PropertyInfo> propertyList = obj.GetType().GetProperties().ToList();
                foreach (var prop in propertyList)
                {
                    if (content.HasProperty(prop.Name))
                    {
                        var name = prop.Name;
                        var val = prop.GetValue(obj, null);
                        content.SetValue(name, val);
                    }
                }
            }
            else
            {
                throw new Exception("Content name and Model name are not same!");
            }
            return content;
        }

        public static Attempt<PublishStatus> SaveAndPublishWithStatus(this IContent content, int userId = 0, bool raiseEvents = true)
        {
            return ApplicationContext.Current.Services.ContentService.SaveAndPublishWithStatus(content, userId, raiseEvents);
        }
        public static void Save(this IContent content, int userId = 0, bool raiseEvents = true)
        {
            try
            {
                ApplicationContext.Current.Services.ContentService.Save(content, userId, raiseEvents);
            }
            catch (Exception)
            {
                throw new Exception("Save content is not successfully!");
            }
        }
        public static bool Publish(this IContent content, int userId = 0)
        {
            try
            {
                return ApplicationContext.Current.Services.ContentService.Publish(content, userId);
            }
            catch (Exception)
            {
                throw new Exception("Publish content is not successfully!");
            }
        }
        public static void Delete(this IContent content, int userId = 0)
        {
            try
            {
                ApplicationContext.Current.Services.ContentService.Delete(content, userId);
            }
            catch (Exception)
            {
                throw new Exception("Delete content is not successfully!");
            }
        }
        public static IContent CreateContent(string name, int parentId, string contentTypeAlias)
        {
            return ApplicationContext.Current.Services.ContentService.CreateContent(name, parentId, contentTypeAlias);
        }

        /// <summary>
        /// This method create a content as a child of publishedContent object.
        /// </summary>
        /// <param name="publishedContent">That is parent of content</param>
        /// <param name="name">is a name of node that will be created.</param>
        /// <param name="contentTypeAlias">is a contentTypeAlias that must be able a child of publishedContent </param>
        /// <returns>IContent</returns>
        public static IContent CreateContentAsChild(this IPublishedContent publishedContent, string name, string contentTypeAlias)
        {
            return CreateContent(name, publishedContent.Id, contentTypeAlias);
        }
    }
}
